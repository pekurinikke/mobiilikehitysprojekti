using UnityEngine;
using UnityEngine.SceneManagement;
public class MovingPlatform : MonoBehaviour
{
    [SerializeField]private float speed;
    [SerializeField]private float range;
    [SerializeField]private float checkDelay;
    [SerializeField]private LayerMask playerLayer;
    private float checkTimer;
    private Vector3 destination;
    private bool attacking;
    private Vector3[] direction = new Vector3[1];

    private void Onable()
    {
        Stop();        
    }
    private void Update()
    {
        if(attacking)
            transform.Translate(destination * Time.deltaTime * speed);
        else{
            checkTimer += Time.deltaTime;
            if (checkTimer > checkDelay);
                CheckForPlayer();
        }
    }
    private void CheckForPlayer(){
        CalculateDirection();
        for (int i = 0; i < direction.Length; i++){
            RaycastHit2D hit = Physics2D.Raycast(transform.position, direction[i], range, playerLayer);

            if (hit.collider != null && !attacking){
                attacking =true;
                destination = direction[i];
                checkTimer = 0;
            }
        }
    }
    private void Stop()
    {
        destination = transform.position;
    }
    private void CalculateDirection(){
        direction[0] = -transform.up * range;
    }
    void OnTriggerEnter2D(Collider2D collision)
    {
        if (collision.tag == "Player"){
            SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
        }
    }

}

